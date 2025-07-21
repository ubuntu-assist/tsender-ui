'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import React from 'react'
import { chainsToTSender, erc20Abi, tsenderAbi } from '@/constants'
import { useChainId, useConfig, useAccount } from 'wagmi'
import { readContract } from '@wagmi/core'

export function AirdropForm() {
  const [totalWei, setTotalWei] = useState('0')
  const [totalTokens, setTotalTokens] = useState('0.00')
  const chainId = useChainId()
  const config = useConfig()
  const account = useAccount()

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
          const arr: string[] = value
            .replace(/\n/g, ',')
            .split(',')
            .map((r: string) => r.trim())
            .filter(Boolean)
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
          const recipientArr = recipients
            .replace(/\n/g, ',')
            .split(',')
            .map((r: string) => r.trim())
            .filter(Boolean)
          const amountArr = value
            .replace(/\n/g, ',')
            .split(',')
            .map((a) => a.trim())
            .filter(Boolean)
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

  const recipients = watch('recipients')
  const amounts = watch('amounts')

  React.useEffect(() => {
    const recipientArray = recipients
      ? recipients
          .replace(/\n/g, ',')
          .split(',')
          .map((r: string) => r.trim())
          .filter(Boolean)
      : []
    const amountArray = amounts
      ? amounts
          .replace(/\n/g, ',')
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean)
      : []
    if (
      amountArray.length === recipientArray.length &&
      amountArray.every((a) => !isNaN(Number(a)) && Number(a) > 0)
    ) {
      const totalWeiValue = amountArray.reduce((sum, a) => sum + Number(a), 0)
      setTotalWei(totalWeiValue.toString())
      setTotalTokens((totalWeiValue / 1e18).toFixed(2))
    } else {
      setTotalWei('0')
      setTotalTokens('0.00')
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

  const onSubmit = async (data: any) => {
    const tSenderAddress = chainsToTSender[chainId]['tsender']
    const approvedAmount = await getApprovedAmount(
      tSenderAddress,
      data.tokenAddress
    )
    console.log(approvedAmount)
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
              />
            </div>
            <div className='flex justify-between'>
              <span>Amount (wei):</span>
              <span className='text-right w-40 text-lg font-semibold'>
                {totalWei}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Amount (tokens):</span>
              <span className='text-right w-40 text-lg font-semibold'>
                {totalTokens}
              </span>
            </div>
          </div>
        </div>
        <Button
          type='submit'
          className='w-full bg-black text-white hover:bg-gray-800 transition-colors duration-300 text-lg py-3'
        >
          Send Tokens
        </Button>
      </div>
    </form>
  )
}
