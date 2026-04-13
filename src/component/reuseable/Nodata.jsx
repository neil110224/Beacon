import React from 'react'
import Lottie from "lottie-react";
import animationNoData from "../../assets/no data error.json";

const Nodata = () => {
  return (
    <div style={{ width: 300,}}>
      <Lottie animationData={animationNoData} loop={true} />
    </div>
  )
}

export default Nodata
