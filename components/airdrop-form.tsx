'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

export function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState('')
  const [recipients, setRecipients] = useState('')
  const [amounts, setAmounts] = useState('')
  const [tokenName, setTokenName] = useState('')
  const [totalWei, setTotalWei] = useState('0')
  const [totalTokens, setTotalTokens] = useState('0.00')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const recipientArray = recipients
      .replace(/\n/g, ',')
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r)
    const amountArray = amounts
      .replace(/\n/g, ',')
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a)

    if (!tokenAddress || !/^[0-9A-Fa-f]{40}$/.test(tokenAddress)) {
      setError('Please enter a valid Token Address.')
      return
    }
    if (
      recipientArray.length === 0 ||
      !recipientArray.every((r) => /^[0-9A-Fa-f]{40}$/.test(r))
    ) {
      setError(
        'Please enter valid Recipient addresses (comma or newline separated).'
      )
      return
    }
    if (
      amountArray.length !== recipientArray.length ||
      !amountArray.every((a) => !isNaN(Number(a)) && Number(a) > 0)
    ) {
      setError(
        'Please enter valid Amounts in wei matching the number of recipients.'
      )
      return
    }
    setError('')
    const totalWeiValue = amountArray.reduce((sum, a) => sum + Number(a), 0)
    setTotalWei(totalWeiValue.toString())
    setTotalTokens((totalWeiValue / 1e18).toFixed(2)) // Assuming 18 decimals for token conversion
    alert(
      `Airdrop submitted for ${recipientArray.length} recipients with ${totalWei} wei!`
    )
    // Add your airdrop logic here
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='w-full max-w-2xl mx-auto p-6 bg-white text-black rounded-lg shadow-lg'
    >
      <h2 className='text-xl font-bold mb-4'>Airdrop Claim</h2>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='tokenAddress'>Token Address</Label>
          <Input
            id='tokenAddress'
            type='text'
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder='0x...'
            className='bg-gray-50 border-gray-300'
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='recipients'>
            Recipients (comma or newline separated)
          </Label>
          <Textarea
            id='recipients'
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder='0x123..., 0x456...'
            className='bg-gray-50 border-gray-300 h-32 resize-y'
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='amounts'>
            Amounts (wei; comma or newline separated)
          </Label>
          <Textarea
            id='amounts'
            value={amounts}
            onChange={(e) => setAmounts(e.target.value)}
            placeholder='100, 200, 300...'
            className='bg-gray-50 border-gray-300 h-32 resize-y'
            required
          />
        </div>
        <div className='space-y-2'>
          <Label>Transaction Details</Label>
          <div className='space-y-1'>
            <div className='flex justify-between'>
              <span>Token Name:</span>
              <Input
                type='text'
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className='w-32 bg-gray-50 border-gray-300 text-right'
              />
            </div>
            <div className='flex justify-between'>
              <span>Amount (wei):</span>
              <span className='text-right w-32'>{totalWei}</span>
            </div>
            <div className='flex justify-between'>
              <span>Amount (tokens):</span>
              <span className='text-right w-32'>{totalTokens}</span>
            </div>
          </div>
        </div>
        {error && <p className='text-red-600 text-sm'>{error}</p>}
        <Button
          type='submit'
          className='w-full bg-black text-white hover:bg-gray-800 transition-colors duration-300'
        >
          Send Tokens
        </Button>
      </div>
    </form>
  )
}
