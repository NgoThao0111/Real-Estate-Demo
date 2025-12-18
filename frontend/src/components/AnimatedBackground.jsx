import { Box, useColorModeValue } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const AnimatedBackground = () => {
  const barColors = useColorModeValue(
    ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'],
    ['#1E3A8A', '#1E40AF', '#2563EB', '#3B82F6', '#60A5FA']
  );
  // Tạo animation cho các thanh chéo với nhiều góc quay và chuyển động nhanh hơn
  const float1 = keyframes`
    0% { transform: translate(0, 0) rotate(30deg); }
    25% { transform: translate(40px, -40px) rotate(50deg); }
    50% { transform: translate(60px, -20px) rotate(70deg); }
    75% { transform: translate(30px, 10px) rotate(40deg); }
    100% { transform: translate(0, 0) rotate(30deg); }
  `;

  const float2 = keyframes`
    0% { transform: translate(0, 0) rotate(-20deg); }
    25% { transform: translate(-30px, 50px) rotate(10deg); }
    50% { transform: translate(-50px, 80px) rotate(-30deg); }
    75% { transform: translate(-20px, 40px) rotate(0deg); }
    100% { transform: translate(0, 0) rotate(-20deg); }
  `;

  const float3 = keyframes`
    0% { transform: translate(0, 0) rotate(60deg); }
    25% { transform: translate(50px, 30px) rotate(80deg); }
    50% { transform: translate(70px, 50px) rotate(100deg); }
    75% { transform: translate(40px, 20px) rotate(70deg); }
    100% { transform: translate(0, 0) rotate(60deg); }
  `;

  const float4 = keyframes`
    0% { transform: translate(0, 0) rotate(-45deg); }
    25% { transform: translate(-40px, -30px) rotate(-20deg); }
    50% { transform: translate(-60px, -50px) rotate(-60deg); }
    75% { transform: translate(-30px, -20px) rotate(-35deg); }
    100% { transform: translate(0, 0) rotate(-45deg); }
  `;

  const float5 = keyframes`
    0% { transform: translate(0, 0) rotate(15deg); }
    33% { transform: translate(35px, 45px) rotate(45deg); }
    66% { transform: translate(-25px, 30px) rotate(-15deg); }
    100% { transform: translate(0, 0) rotate(15deg); }
  `;

  const float6 = keyframes`
    0% { transform: translate(0, 0) rotate(-60deg); }
    33% { transform: translate(-45px, -35px) rotate(-90deg); }
    66% { transform: translate(30px, -50px) rotate(-40deg); }
    100% { transform: translate(0, 0) rotate(-60deg); }
  `;

  // Tạo các thanh chéo với màu, kích thước và animation đa dạng
  const bars = [
    // Màu xanh đậm - animation nhanh hơn
    { width: "120px", height: "15px", top: "10%", left: "5%", colorIndex: 0, animation: `${float1} 4s ease-in-out infinite` },
    { width: "80px", height: "12px", top: "25%", left: "75%", colorIndex: 0, animation: `${float2} 5s ease-in-out infinite` },
    { width: "100px", height: "14px", top: "70%", left: "15%", colorIndex: 0, animation: `${float3} 4.5s ease-in-out infinite` },
    { width: "90px", height: "13px", top: "85%", left: "70%", colorIndex: 0, animation: `${float4} 5.5s ease-in-out infinite` },
    
    // Màu xanh vừa - animation nhanh hơn
    { width: "110px", height: "14px", top: "15%", left: "45%", colorIndex: 2, animation: `${float5} 4.5s ease-in-out infinite` },
    { width: "95px", height: "13px", top: "40%", left: "20%", colorIndex: 2, animation: `${float6} 5s ease-in-out infinite` },
    { width: "105px", height: "15px", top: "55%", left: "80%", colorIndex: 2, animation: `${float1} 4s ease-in-out infinite` },
    { width: "85px", height: "12px", top: "90%", left: "40%", colorIndex: 2, animation: `${float2} 4.5s ease-in-out infinite` },
    
    // Màu xanh nhạt - animation nhanh hơn
    { width: "100px", height: "13px", top: "8%", left: "65%", colorIndex: 3, animation: `${float3} 5.5s ease-in-out infinite` },
    { width: "115px", height: "14px", top: "30%", left: "50%", colorIndex: 3, animation: `${float4} 4s ease-in-out infinite` },
    { width: "90px", height: "12px", top: "50%", left: "10%", colorIndex: 3, animation: `${float5} 5s ease-in-out infinite` },
    { width: "75px", height: "11px", top: "75%", left: "85%", colorIndex: 3, animation: `${float6} 4.5s ease-in-out infinite` },
    
    // Màu xanh rất nhạt - animation nhanh hơn
    { width: "105px", height: "13px", top: "20%", left: "30%", colorIndex: 4, animation: `${float1} 4.5s ease-in-out infinite` },
    { width: "85px", height: "12px", top: "45%", left: "60%", colorIndex: 4, animation: `${float2} 5.5s ease-in-out infinite` },
    { width: "95px", height: "14px", top: "65%", left: "45%", colorIndex: 4, animation: `${float3} 5s ease-in-out infinite` },
    { width: "80px", height: "11px", top: "80%", left: "25%", colorIndex: 4, animation: `${float4} 4s ease-in-out infinite` },
    
    // Thêm một vài thanh nữa với góc quay đặc biệt
    { width: "70px", height: "10px", top: "35%", left: "85%", colorIndex: 0, animation: `${float5} 6s ease-in-out infinite` },
    { width: "88px", height: "11px", top: "60%", left: "5%", colorIndex: 2, animation: `${float6} 5.5s ease-in-out infinite` },
    { width: "92px", height: "12px", top: "5%", left: "90%", colorIndex: 3, animation: `${float1} 6s ease-in-out infinite` },
    { width: "78px", height: "10px", top: "95%", left: "55%", colorIndex: 4, animation: `${float3} 5s ease-in-out infinite` },
  ];

  const bgColor = useColorModeValue("#DBEAFE", "#1A202C");

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      bg={bgColor}
      overflow="hidden"
      zIndex={-1}
      pointerEvents="none"
    >
      {bars.map((bar, index) => (
        <Box
          key={index}
          position="absolute"
          width={bar.width}
          height={bar.height}
          bg={barColors[bar.colorIndex]}
          top={bar.top}
          left={bar.left}
          transform="rotate(45deg)"
          animation={bar.animation}
          borderRadius="2px"
          opacity={0.8}
        />
      ))}
    </Box>
  );
};

export default AnimatedBackground;
