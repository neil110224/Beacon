import Lottie from 'lottie-react'
import ExclamationAnimation from "../../assets/Exclamations!!!.json";
import React from 'react'


const Exclamation = () => {
  return (
    <div style={{ width: 80 }}>
      <Lottie animationData={ExclamationAnimation} loop={true} />
    </div>
  )
}

export default Exclamation
