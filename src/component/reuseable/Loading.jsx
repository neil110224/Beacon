import Lottie from "lottie-react";
import animationData from "../../assets/code dark.json";

function Loading() {
  return (
    <div style={{ width: 300 }}>
      <Lottie animationData={animationData} loop={true} />
    </div>
  );
}

export default Loading;