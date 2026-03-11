import Lottie from 'lottie-react'
import Done from "../../assets/Confetti.json";
import React from 'react'


const Done = () => {
  return (
    <div style={{ width: 80 }}>
      <Lottie animationData={Done} loop={true} />
    </div>
  )
}

export default Done
