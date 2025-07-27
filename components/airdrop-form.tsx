'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useMemo, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import React from 'react'
import { chainsToTSender, erc20Abi, tsenderAbi } from '@/constants'
import { useChainId, useConfig, useAccount, useWriteContract } from 'wagmi'
import { readContract, waitForTransactionReceipt } from '@wagmi/core'
import { parseListInput } from '@/utils/parsetInput/parse-input'
import { AirdropFormData } from '@/types/airdrop-form-data'

export function AirdropForm() {
  const chainId = useChainId()
  const config = useConfig()
  const account = useAccount()
  const { data: hash, isPending, writeContractAsync } = useWriteContract()
  const [isMounted, setIsMounted] = useState(false)

  const schema = yup.object().shape({
    tokenAddress: yup
      .string()
      .required('Token Address is required')
      .matches(/^0x[0-9A-Fa-f]{40}$/, 'Please enter a valid Token Address.'),
    recipients: yup
      .string()
      .required('Recipients are required')
      .test(
        'recipients-format',
        'Please enter valid Recipient addresses (comma or newline separated).',
        (value) => {
          if (!value) return false
          const arr: string[] = parseListInput(value)
          return (
            arr.length > 0 &&
            arr.every((r: string) => /^0x[0-9A-Fa-f]{40}$/.test(r))
          )
        }
      ),
    amounts: yup
      .string()
      .required('Amounts are required')
      .test(
        'amounts-format',
        'Please enter valid Amounts in wei matching the number of recipients.',
        function (value) {
          const { recipients } = this.parent
          if (!value || !recipients) return false
          const recipientArr = parseListInput(recipients)
          const amountArr = parseListInput(value)
          return (
            amountArr.length === recipientArr.length &&
            amountArr.every((a) => !isNaN(Number(a)) && Number(a) > 0)
          )
        }
      ),
    tokenName: yup.string(),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      tokenAddress: '',
      recipients: '',
      amounts: '',
      tokenName: '',
    },
  })

  const tokenAddress = watch('tokenAddress')
  const recipients = watch('recipients')
  const amounts = watch('amounts')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      const savedData = localStorage.getItem('airdropFormData')
      if (savedData) {
        const { tokenAddress, recipients, amounts, tokenName } =
          JSON.parse(savedData)
        if (tokenAddress) setValue('tokenAddress', tokenAddress)
        if (recipients) setValue('recipients', recipients)
        if (amounts) setValue('amounts', amounts)
        if (tokenName) setValue('tokenName', tokenName)
      }
    }
  }, [isMounted, setValue])

  // Save form data to localStorage whenever inputs change (client-side only)
  useEffect(() => {
    if (isMounted) {
      const formData = { tokenAddress, recipients, amounts }
      localStorage.setItem('airdropFormData', JSON.stringify(formData))
    }
  }, [isMounted, tokenAddress, recipients, amounts])

  // Fetch token name when tokenAddress changes (client-side only)
  useEffect(() => {
    const fetchTokenName = async () => {
      if (
        isMounted &&
        tokenAddress &&
        /^0x[0-9A-Fa-f]{40}$/.test(tokenAddress)
      ) {
        try {
          const tokenName = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: 'name',
          })
          setValue('tokenName', tokenName as string)
          // Update localStorage with tokenName
          localStorage.setItem(
            'airdropFormData',
            JSON.stringify({ tokenAddress, recipients, amounts, tokenName })
          )
        } catch (error) {
          console.error('Error fetching token name:', error)
          setValue('tokenName', '')
          localStorage.setItem(
            'airdropFormData',
            JSON.stringify({ tokenAddress, recipients, amounts, tokenName: '' })
          )
        }
      } else if (isMounted) {
        setValue('tokenName', '')
        localStorage.setItem(
          'airdropFormData',
          JSON.stringify({ tokenAddress, recipients, amounts, tokenName: '' })
        )
      }
    }

    fetchTokenName()
  }, [isMounted, tokenAddress, config, setValue, recipients, amounts])

  const { totalWei, totalTokens } = useMemo(() => {
    const recipientArray = parseListInput(recipients)
    const amountArray = parseListInput(amounts)
    if (
      amountArray.length === recipientArray.length &&
      amountArray.every((a) => !isNaN(Number(a)) && Number(a) > 0)
    ) {
      const totalWeiValue = amountArray.reduce((sum, a) => sum + Number(a), 0)
      return {
        totalWei: totalWeiValue.toString(),
        totalTokens: (totalWeiValue / 1e18).toFixed(2),
      }
    } else {
      return {
        totalWei: '0',
        totalTokens: '0.00',
      }
    }
  }, [recipients, amounts])

  const getApprovedAmount = async (
    tSenderAddress: string | null,
    tokenAddress: string
  ): Promise<number> => {
    if (!tSenderAddress) {
      alert('No address found, please use a supported chain')
      return 0
    }

    const response = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress as `0x${string}`,
      functionName: 'allowance',
      args: [account.address, tSenderAddress as `0x${string}`],
    })

    return response as number
  }

  const onSubmit = async (data: AirdropFormData) => {
    const { tokenAddress } = data
    const tSenderAddress = chainsToTSender[chainId]['tsender']
    const approvedAmount = await getApprovedAmount(tSenderAddress, tokenAddress)

    if (approvedAmount < Number(totalWei)) {
      const approvalHash = await writeContractAsync({
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: 'approve',
        args: [tSenderAddress as `0x${string}`, BigInt(Number(totalWei))],
      })

      const approvalReceipt = await waitForTransactionReceipt(config, {
        hash: approvalHash,
      })
      console.log('Approval confirmed', approvalReceipt)

      await writeContractAsync({
        abi: tsenderAbi,
        address: tSenderAddress as `0x${string}`,
        functionName: 'airdropERC20',
        args: [
          tokenAddress,
          parseListInput(recipients),
          parseListInput(amounts),
          BigInt(Number(totalWei)),
        ],
      })
    } else {
      await writeContractAsync({
        abi: tsenderAbi,
        address: tSenderAddress as `0x${string}`,
        functionName: 'airdropERC20',
        args: [
          tokenAddress,
          parseListInput(recipients),
          parseListInput(amounts),
          BigInt(Number(totalWei)),
        ],
      })
    }
  }

  if (!isMounted) {
    return null
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='w-full max-w-2xl mx-auto p-6 bg-white text-black rounded-lg shadow-lg'
    >
      <h2 className='text-2xl font-bold mb-6'>Airdrop Claim</h2>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='tokenAddress' className='text-lg'>
            Token Address
          </Label>
          <Input
            id='tokenAddress'
            type='text'
            {...register('tokenAddress')}
            placeholder='0x...'
            className='bg-gray-50 border-gray-300 text-lg py-3'
          />
          {errors.tokenAddress && (
            <p className='text-red-600 text-base'>
              {errors.tokenAddress.message as string}
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='recipients' className='text-lg'>
            Recipients (comma or newline separated)
          </Label>
          <Textarea
            id='recipients'
            {...register('recipients')}
            placeholder='0x123..., 0x456...'
            className='bg-gray-50 border-gray-300 h-32 resize-y text-lg py-3'
          />
          {errors.recipients && (
            <p className='text-red-600 text-base'>
              {errors.recipients.message as string}
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='amounts' className='text-lg'>
            Amounts (wei; comma or newline separated)
          </Label>
          <Textarea
            id='amounts'
            {...register('amounts')}
            placeholder='100, 200, 300...'
            className='bg-gray-50 border-gray-300 h-32 resize-y text-lg py-3'
          />
          {errors.amounts && (
            <p className='text-red-600 text-base'>
              {errors.amounts.message as string}
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <Label className='text-lg'>Transaction Details</Label>
          <div className='space-y-1'>
            <div className='flex justify-between'>
              <span>Token Name:</span>
              <Input
                type='text'
                {...register('tokenName')}
                className='w-40 bg-gray-50 border-gray-300 text-right text-lg py-2'
                readOnly
              />
            </div>
            <div className='flex justify-between'>
              <span>Amount (wei):</span>
              <span className='w-56 text-right text-lg font-semibold'>
                {totalWei}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Amount (tokens):</span>
              <span className='w-40 text-right text-lg font-semibold'>
                {totalTokens}
              </span>
            </div>
          </div>
        </div>
        <Button
          type='submit'
          className='w-full bg-black text-white hover:bg-gray-800 transition-colors duration-300 text-lg py-3 cursor-pointer'
          disabled={isPending}
        >
          {isPending ? 'Processing...' : 'Send Tokens'}
        </Button>
      </div>
    </form>
  )
}
