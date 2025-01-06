interface FadeInProps {
  direction: string;
  type: string;
  delay: number;
  duration: number;
}

export const fadeIn = ({ direction, type, delay, duration }: FadeInProps) => ({
  hidden: {
    x: direction === "left" ? 100 : direction === "right" ? -100 : 0,
    y: direction === "top" ? 100 : direction === "down" ? -100 : 0,
    opacity: 0,
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type,
      delay,
      duration,
      ease: "easeInOut",
    },
  },
});

export const textContainer = {
  hidden: {
    opacity: 0,
  },
  show: (i = 1) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: i * 0.1,
    },
  }),
};

export const textVariants2 = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "tween",
      ease: "easeIn",
    },
  },
};

export const slideDown = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
