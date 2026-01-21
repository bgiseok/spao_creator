
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
            <h2 className="text-6xl font-black text-gray-900 mb-4">404</h2>
            <p className="text-xl font-bold text-gray-700 mb-2">페이지를 찾을 수 없습니다</p>
            <p className="text-gray-500 mb-8">요청하신 크리에이터 페이지나 상품이 존재하지 않습니다.</p>
            <Link
                href="/"
                className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors"
            >
                홈으로 돌아가기
            </Link>
        </div>
    );
}
