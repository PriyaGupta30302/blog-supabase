import Header from '@/components/Header';
import BlogDetailSkeleton from '@/components/BlogDetailSkeleton';

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <BlogDetailSkeleton />
    </div>
  );
}
