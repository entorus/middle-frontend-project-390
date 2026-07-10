import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className='text-center'>
      <h1>404</h1>
      <p>Ничего не найдено <Link to="/">Вернуться на главную</Link></p>
    </div>
  )
}
