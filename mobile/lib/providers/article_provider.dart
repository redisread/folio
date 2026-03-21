import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/article.dart';
import 'auth_provider.dart';
import 'feed_provider.dart';

final articlesProvider = FutureProvider<List<Article>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final selectedFeedId = ref.watch(selectedFeedIdProvider);
  final data = await api.getArticles(feedId: selectedFeedId);
  return data.map((e) => Article.fromJson(e as Map<String, dynamic>)).toList();
});

final selectedArticleIdProvider = StateProvider<String?>((ref) => null);
