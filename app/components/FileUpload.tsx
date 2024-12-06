// FileUpload.tsx
import React from "react";
import { Input } from "@/components/ui/input";

interface FileUploadProps {
  handleUploadJson: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ handleUploadJson }) => {
  return (
    <div className="mt-4 w-full max-w-sm mx-auto p-4 bg-white rounded-lg">
      <label
        htmlFor="file-upload"
        className="block text-sm font-medium text-gray-700 cursor-pointer"
      >
        Or import an existing JSON
      </label>
      <Input id="file-upload" type="file" onChange={handleUploadJson} />
    </div>
  );
};

export default FileUpload;
