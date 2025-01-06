"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./carousel.module.scss";
import Image from "next/image";

export interface CarouselItem {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
}

const carouselData: CarouselItem[] = [
  {
    id: 1,
    imageUrl: "/images/banner/5.png",
    title: "Card 1",
    description: "Description for card 1",
  },
  {
    id: 2,
    imageUrl: "/images/banner/2.png",
    title: "Card 2",
    description: "Description for card 2",
  },
  {
    id: 3,
    imageUrl: "/images/banner/1.png",
    title: "Card 3",
    description: "Description for card 3",
  },
  {
    id: 4,
    imageUrl: "/images/banner/3.png",
    title: "Card 4",
    description: "Description for card 4",
  },
  {
    id: 5,
    imageUrl: "/images/banner/4.png",
    title: "Card 5",
    description: "Description for card 5",
  },
];

const Carousel = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState(0.5);

  useEffect(() => {
    const moveCarousel = () => {
      setPosition((prev) => {
        let newPosition = prev - speed;
        if (newPosition < -320) {
          newPosition = 0;
          if (carouselRef.current) {
            carouselRef.current.appendChild(
              carouselRef.current.firstElementChild as Node
            );
          }
        }
        return newPosition;
      });
      requestAnimationFrame(moveCarousel);
    };

    moveCarousel();

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("mouseenter", () => setSpeed(0));
      carousel.addEventListener("mouseleave", () => setSpeed(0.5));
    }

    return () => {
      if (carousel) {
        carousel.removeEventListener("mouseenter", () => setSpeed(0));
        carousel.removeEventListener("mouseleave", () => setSpeed(0.5));
      }
    };
  }, [speed]);

  return (
    <div className="relative w-full h-96">
      <div
        ref={carouselRef}
        className="absolute w-fit left-1/2 transform -translate-x-1/2 h-[800px] rounded-full bottom-[-420px] perspective-[1000px]"
        style={{ transform: `rotate(-5deg) translateX(${position}px)` }}
      >
        <div className="absolute w-full h-full flex gap-6 p-0 [calc(25%-150px)] items-start transform-origin-center">
          {carouselData.map((item: CarouselItem) => (
            <div
              key={item.id}
              className={`${styles.carouselCard} carousel-card`}
            >
              <Image
                width={100}
                height={100}
                src={item.imageUrl}
                alt={item.title}
              />
              <div className="p-4">
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
