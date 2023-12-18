import '../styles/ErrorList.css'

function ErrorList({ errList }) {
  return (
    <ul className='errorList'>
      {errList.map((error) => {
        return <li className='error' key={error}>{error}</li>
      })}
    </ul>
  );
}

export default ErrorList
