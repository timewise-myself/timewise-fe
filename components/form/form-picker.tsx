/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { unsplash } from "@/lib/unsplash";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { defaultImages } from "@/constants/images";
import Link from "next/link";
import { FormErrors } from "./form-error";

interface Props {
  id: string;
  error?: Record<string, string[] | undefined>;
}

const FormPicker = ({ id, error }: Props) => {
  const { pending } = useFormStatus();
  const [images, setImages] =
    useState<Array<Record<string, any>>>(defaultImages);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const result = await unsplash.photos.getRandom({
          collectionIds: ["317009"],
          count: 9,
        });

        if (result && result.response) {
          const newImages = result.response as Array<Record<string, any>>;
          setImages(newImages);
        }
      } catch (error) {
        setImages(defaultImages);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-sky-700 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <div className="grid grid-cols-3 gap-2 mb-2">
          {images.map((image) => (
            <div
              key={image.id}
              className={cn(
                "cursor-pointer relative aspect-video group hover:opacity-75 transition bg-muted",
                pending && "opacity-50 hover:opacity-50 cursor-auto"
              )}
              onClick={() => {
                if (pending) return;
                setSelectedImageId(image.id);
              }}
            >
              <input
                type="radio"
                id={id}
                name={id}
                className="hidden"
                checked={selectedImageId === image.id}
                disabled={pending}
                value={`${image.id}|${image.urls.thumb}|${image.urls.full}|${image.links.html} | ${image.user.name}`}
              />
              <Image
                fill
                src={image.urls.small}
                alt={image.alt_description}
                className="object-cover rounded-sm"
              />
              {selectedImageId === image.id && (
                <div className="absolute inset-y-0 h-full w-full bg-black/30 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
              <Link
                href={image.links.html}
                target="_blank"
                className="opacity-0 group-hover:opacity-100 absolute bottom-0 w-full text-[10px] truncate text-white
                  hover:underline p-1 bg-black/50
                "
              >
                {image.user.name}
              </Link>
            </div>
          ))}
        </div>
        <FormErrors errors={error} id="image" />
      </div>
    </>
  );
};

export default FormPicker;
