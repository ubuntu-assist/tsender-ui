import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { IconBrandGithub } from '@tabler/icons-react'

export function Header() {
  return (
    <header className='sticky top-0 z-50 w-full bg-black text-white shadow-lg'>
      <div className='container mx-auto flex justify-between items-center p-4'>
        <div className='flex items-center space-x-4'>
          <h1 className='text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-gray-100'>
            TSender
          </h1>
          <Separator orientation='vertical' className='h-6 bg-gray-600' />
          <Button
            variant='ghost'
            size='icon'
            asChild
            className='hover:bg-gray-700/50 transition-colors duration-300 text-gray-300 hover:text-white'
          >
            <a
              href='https://github.com/your-repo'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='GitHub repository'
            >
              <IconBrandGithub className='h-5 w-5' />
            </a>
          </Button>
        </div>
        <div className='flex items-center'>
          <ConnectButton
            showBalance={false}
            chainStatus='icon'
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
          />
        </div>
      </div>
    </header>
  )
}
