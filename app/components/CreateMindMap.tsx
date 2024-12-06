"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Hero from "./Hero";
import CreateMindMapForm from "./CreateMindMapForm";
import Credits from "./Credits";
import RetroGrid from "@/components/ui/retro-grid";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { uploadJson } from "@/lib/utils";

interface CreateMindMapProps {
  fetchMindMap: (topic: string) => void;
  setMindMapData: (data: any) => void;
}

const CreateMindMap = ({
  fetchMindMap,
  setMindMapData,
}: CreateMindMapProps) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateMindMapContent
        fetchMindMap={fetchMindMap}
        setMindMapData={setMindMapData}
      />
    </Suspense>
  );
};

const CreateMindMapContent = ({
  fetchMindMap,
  setMindMapData,
}: CreateMindMapProps) => {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") === "true";

  useEffect(() => {
    if (error) {
      toast.error(
        "There was an error generating your mind map, please try again."
      );
    }
  }, [error]);

  const handleUploadJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    uploadJson(file)
      .then((data) => {
        setMindMapData(data);
      })
      .catch((_error) => {
        toast.error(
          "There was an error uploading your mind map, please try again."
        );
      });
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg">
        <Hero />
        <div className="mt-10 w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <CreateMindMapForm onSubmit={fetchMindMap} />
            <div className="mt-4 w-full max-w-sm mx-auto p-4 bg-white rounded-lg">
              <label
                htmlFor="file-upload"
                className="block text-sm font-medium text-gray-700 cursor-pointer"
              >
                Or import an existing JSON
              </label>
              <Input id="file-upload" type="file" onChange={handleUploadJson} />
            </div>
          </motion.div>
        </div>
        <RetroGrid />
      </div>
      <Credits />
    </div>
  );
};

export default CreateMindMap;
