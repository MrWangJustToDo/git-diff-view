export default function Layout({ children }: {children: React.ReactNode}) {
  console.log('layout test');
  
  return <div data-layout='test'>{children}</div>
}