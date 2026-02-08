interface HomeWrapperProps {
  children: React.ReactNode
}

export default function HomeWrapper({ children }: HomeWrapperProps) {
  return <>{children}</>
}
