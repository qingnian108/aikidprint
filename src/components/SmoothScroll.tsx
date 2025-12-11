import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

const SmoothScroll = () => {
  useEffect(() => {
    // 初始化 Lenis 平滑滚动
    const lenis = new Lenis({
      duration: 1.2, // 滚动持续时间
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // 缓动函数
      orientation: 'vertical', // 垂直滚动
      gestureOrientation: 'vertical', // 手势方向
      smoothWheel: true, // 平滑鼠标滚轮
      wheelMultiplier: 1, // 滚轮速度倍数
      touchMultiplier: 2, // 触摸速度倍数
      infinite: false, // 不循环滚动
    });

    // 动画循环
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // 清理函数
    return () => {
      lenis.destroy();
    };
  }, []);

  return null; // 这个组件不渲染任何内容
};

export default SmoothScroll;
