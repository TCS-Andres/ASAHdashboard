import { Eye, Heart } from 'lucide-react';
import { fmtInt } from '@/lib/format';
import type { TopPost } from '@/lib/data';

interface Props {
  posts: TopPost[];
}

const TopPostsList = ({ posts }: Props) => (
  <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
    <div className="px-4 pt-4 pb-2 flex items-baseline justify-between">
      <h2 className="text-sm font-semibold text-foreground">Top posts</h2>
      <p className="text-xs text-muted-foreground">By reach</p>
    </div>
    {posts.length === 0 ? (
      <p className="px-4 pb-4 text-xs text-muted-foreground">No posts in this window.</p>
    ) : (
      <ol className="divide-y divide-border">
        {posts.map((post, i) => (
          <li key={post.id} className="flex items-start gap-3 px-4 py-3">
            <span className="text-xs font-bold text-muted-foreground w-5 shrink-0 mt-0.5 tabular-nums">
              #{i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{post.snippet}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Posted {post.publishedAt}
              </p>
            </div>
            <div className="flex flex-col items-end gap-0.5 text-xs shrink-0 tabular-nums">
              <span className="inline-flex items-center gap-1 text-foreground">
                <Eye size={12} className="text-muted-foreground" />
                {fmtInt(post.reach)}
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Heart size={12} />
                {fmtInt(post.engagement)}
              </span>
            </div>
          </li>
        ))}
      </ol>
    )}
  </div>
);

export default TopPostsList;
