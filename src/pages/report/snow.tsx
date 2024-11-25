"use client";
import { useEffect } from "react";

const Snow = () => {
  useEffect(() => {
    const canvas: any = document.getElementById("snowCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let snowflakes = [];

    function createSnowflake() {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 4 + 1; // Kích thước bông tuyết
      const speed = Math.random() * 2 + 1; // Tốc độ rơi
      const opacity = Math.random();

      snowflakes.push({ x, y, radius, speed, opacity });
    }

    function drawSnowflake(snowflake) {
      ctx.beginPath();
      ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${snowflake.opacity})`;
      ctx.fill();
      ctx.closePath();
    }

    function updateSnowflake(snowflake) {
      snowflake.y += snowflake.speed;

      if (snowflake.y > canvas.height) {
        snowflake.y = -snowflake.radius;
        snowflake.x = Math.random() * canvas.width;
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakes.forEach((snowflake, index) => {
        drawSnowflake(snowflake);
        updateSnowflake(snowflake);
      });

      requestAnimationFrame(animate);
    }

    function init() {
      for (let i = 0; i < 100; i++) {
        // Số lượng bông tuyết
        createSnowflake();
      }
      animate();
    }

    // Cập nhật canvas khi thay đổi kích thước cửa sổ
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      snowflakes = [];
      init();
    });

    init();
  });
  return <canvas id="snowCanvas" className="w-screen h-screen fixed top-0 left-0 pointer-events-none"></canvas>;
};

export default Snow;
