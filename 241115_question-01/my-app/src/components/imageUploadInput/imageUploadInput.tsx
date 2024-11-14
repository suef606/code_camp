// components/ImageUploadInput.tsx

import { useRef, ChangeEvent } from "react";
import Image from "next/image";
import defaultImage from "@/../public/assets/image.png";
import styles from "./ImageUploadInput.module.css"; // 스타일 파일

interface ImageUploadInputProps {
  imageUrls: string[];
  setImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  isEdit: boolean;
  data: any;
}

const ImageUploadInput = ({
  imageUrls,
  setImageUrls,
  files,
  setFiles,
  isEdit,
  data,
}: ImageUploadInputProps) => {
  const fileRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const onChangeFile =
    (index: number) => async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = (event) => {
        console.log(event.target?.result);
        if (typeof event.target?.result === "string") {
          console.log(fileReader.result, "파일리더 결과값입니다. ::::::::::");
          const newImageUrls = [...imageUrls];
          newImageUrls[index] = event.target.result;
          // newImageUrls[index] = fileReader.result;
          setImageUrls(newImageUrls);
          console.log("newImageUrls::::::::::", newImageUrls);

          const newFiles = [...files]; // []
          //중요!!!! files- 배열의 빈값으로 들어갈 경우 오류가 발생하므로 빈배열을 거르는 조건을 추가함
          // if (newFiles.length === 0) return;
          newFiles[index] = file;
          setFiles(newFiles);
          console.log("newFiles::::::", setFiles);
        }
      };
    };

  return (
    <div>
      <label>이미지</label>
      <div className={styles.imageContainer}>
        {[0, 1, 2].map((index) => (
          <div key={index} className={styles.imageBox}>
            <input
              type="file"
              accept="image/*"
              onChange={onChangeFile(index)}
              ref={fileRefs[index]}
              style={{ display: "none" }}
            />

            <div>
              <Image
                src={
                  isEdit
                    ? imageUrls[index] ||
                      `https://storage.googleapis.com/${data.fetchBoard.images[index]}`
                    : imageUrls[index] || defaultImage
                } // 인덱스별로 URL 또는 기본 이미지
                alt={`image preview ${index + 1}`}
                // fill
                width={80}
                height={80}
                objectFit="cover"
                onClick={() => fileRefs[index].current?.click()}
                className={styles.clickableImage}
                priority //우선로딩
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploadInput;
