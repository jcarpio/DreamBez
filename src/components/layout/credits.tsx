"use client";

import { useState, useEffect } from "react";
import { Coins } from "lucide-react";
import { Drawer } from "vaul";
import { useRouter } from "next/navigation";

import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
// 导入获取用户credits的函数和购买credits的函数
import { getUserCredits, buyCredits, spendCredits } from "@/lib/credits";

export function CreditsDisplay({ showCredits = false }: { showCredits?: boolean }) {
  const [open, setOpen] = useState(false);
  const closeDrawer = () => setOpen(false);
  const { isMobile } = useMediaQuery();
  // 新增状态来存储用户的credits
  const [credits, setCredits] = useState(0);
  const router = useRouter();

  // 在组件加载时获取用户的credits
  const fetchCredits = async () => {
    try {
      const userCredits = await getUserCredits();
      setCredits(userCredits);
    } catch (error) {
      console.error("Failed to fetch user credits:", error);
    }
  };

  useEffect(() => {
    fetchCredits();
    const intervalId = setInterval(fetchCredits, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // 处理购买credits的函数
  const handleAddCredits = async () => {
    try {
      const randomCredits = Math.floor(Math.random() * 100) + 1; // 随机生成一个1到100的整数
      const newCredits = await buyCredits(randomCredits);//随机
      setCredits(newCredits);
      toast.success(`Credits updated successfully ${randomCredits} credits`);
    } catch (error) {
      console.error("Failed to buy credits:", error);
    }
  };

  const handleSpendCredits = async () => {
    try {
      const randomCredits = Math.floor(Math.random() * 10) + 1; // 随机生成一个1到10的整数
      const newCredits = await spendCredits(randomCredits);
      setCredits(newCredits);
      toast.success(`Credits updated successfully ${randomCredits} credits`);
    } catch (error) {
      console.error("Failed to use credits:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      fetchCredits();
    }
  };

  const creditsContent = (
    <div className="p-4 text-sm">
      <h2 className="mb-2 text-base font-semibold">Credits</h2>
      <p className="text-md text-foreground">Your current balance: <span className="font-bold">{credits}</span>{" "}Credits</p>
      <Button className="mr-2 mt-4 text-sm" onClick={() => router.push('/pricing')}><Coins className="mr-2 size-4" />Buy Credits</Button>
      {/* <p className="mt-2">Credits are used for...</p> */}
      {/* <Button className="mr-2 mt-4" onClick={handleAddCredits}>Add Credits</Button> */}
      {/* <Button className="mt-4" onClick={handleSpendCredits}>Use Credits</Button> */}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={handleOpenChange}>
        <Drawer.Trigger asChild>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <Coins className="mr-2 size-4" />
            Credits{showCredits ? `: ${credits}` : ''}
          </Button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mb-10 mt-24 rounded-t-[10px] border bg-background">
            <div className="mx-auto my-4 h-1.5 w-12 shrink-0 rounded-full bg-muted" />
            {creditsContent}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Coins className="mr-2 size-4" />
          Credits{showCredits ? `: ${credits}` : ''}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        {creditsContent}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}