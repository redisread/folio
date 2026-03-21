import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../providers/article_provider.dart';

/// 文章详情页
class ArticleDetailScreen extends ConsumerWidget {
  final String articleId;

  const ArticleDetailScreen({super.key, required this.articleId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final articlesAsync = ref.watch(articlesProvider);

    return articlesAsync.when(
      data: (articles) {
        final article = articles.firstWhere(
          (a) => a.id == articleId,
          orElse: () => throw Exception('文章不存在'),
        );

        return Scaffold(
          appBar: AppBar(
            title: Text(article.title, overflow: TextOverflow.ellipsis),
            actions: [
              IconButton(
                icon: Icon(
                    article.isStarred ? Icons.star : Icons.star_border),
                onPressed: () {/* 收藏 */},
              ),
            ],
          ),
          body: article.content != null
              ? WebViewWidget(
                  controller: WebViewController()
                    ..loadHtmlString(article.content!),
                )
              : Center(
                  child: ElevatedButton(
                    onPressed: () {/* 打开原文 */},
                    child: const Text('查看原文'),
                  ),
                ),
        );
      },
      loading: () =>
          const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(body: Center(child: Text('错误：$e'))),
    );
  }
}
