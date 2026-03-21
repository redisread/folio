import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../widgets/feed_list_tile.dart';
import '../widgets/article_card.dart';
import '../providers/feed_provider.dart';
import '../providers/article_provider.dart';

/// 主页：根据屏幕宽度显示单栏或双栏布局
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isWide = MediaQuery.of(context).size.width > 768;

    if (isWide) {
      return _buildWideLayout(context, ref);
    }
    return _buildNarrowLayout(context, ref);
  }

  Widget _buildWideLayout(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: Row(
        children: [
          SizedBox(width: 240, child: _buildFeedSidebar(ref)),
          const VerticalDivider(width: 1),
          Expanded(child: _buildArticleList(ref)),
        ],
      ),
    );
  }

  Widget _buildNarrowLayout(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Collect')),
      drawer: Drawer(child: _buildFeedSidebar(ref)),
      body: _buildArticleList(ref),
    );
  }

  Widget _buildFeedSidebar(WidgetRef ref) {
    final feedsAsync = ref.watch(feedsProvider);
    return feedsAsync.when(
      data: (feeds) => ListView.builder(
        itemCount: feeds.length,
        itemBuilder: (ctx, i) => FeedListTile(feed: feeds[i]),
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('错误：$e')),
    );
  }

  Widget _buildArticleList(WidgetRef ref) {
    final articlesAsync = ref.watch(articlesProvider);
    return articlesAsync.when(
      data: (articles) => ListView.builder(
        itemCount: articles.length,
        itemBuilder: (ctx, i) => ArticleCard(article: articles[i]),
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('错误：$e')),
    );
  }
}
