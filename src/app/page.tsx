
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
      <h1 className="text-5xl font-black tracking-tighter mb-4">스파오 크리에이터</h1>
      <p className="text-gray-400 mb-8 max-w-md">나만의 스파오 카탈로그를 생성하실 수 있습니다</p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:w-auto sm:max-w-none">
        <Link
          href="/admin"
          className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors w-full sm:w-auto text-center whitespace-nowrap"
        >
          관리자 페이지로 이동
        </Link>
        <Link
          href="/test"
          className="border border-white/20 px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-colors w-full sm:w-auto text-center whitespace-nowrap"
        >
          샘플 링크트리 보기
        </Link>
      </div>
    </div>
  );
}
