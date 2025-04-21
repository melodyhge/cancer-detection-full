
import { useEffect, useState } from "react";

/**
 * Hook to create a delayed mount animation effect
 * @param delay Time in milliseconds to delay the animation
 * @returns Boolean indicating if the component should be visible
 */
export const useDelayedAppear = (delay = 100) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return isVisible;
};

/**
 * Adds staggered animation delays to children
 * @param index Index of the child element
 * @param baseDelay Base delay in milliseconds
 * @returns Animation delay in seconds
 */
export const getStaggeredDelay = (index: number, baseDelay = 50) => {
  return `${(index * baseDelay) / 1000}s`;
};

/**
 * Returns classNames for fade-in animations with staggered delay
 * @param index Index of the element in a list
 * @param baseClass Base classes to apply
 * @returns String of CSS classes
 */
export const getFadeInClass = (index: number, baseClass = "") => {
  return `${baseClass} opacity-0 animate-fade-in`.trim();
};

/**
 * Returns style object with animation delay for staggered animations
 * @param index Index of the element in a list
 * @param baseDelay Base delay in milliseconds
 * @returns Style object with animation-delay
 */
export const getStaggeredStyle = (index: number, baseDelay = 50) => {
  return {
    animationDelay: getStaggeredDelay(index, baseDelay),
  };
};
