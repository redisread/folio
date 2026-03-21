class Feed {
  final String id;
  final String userId;
  final String? folderId;
  final String title;
  final String url;
  final String feedUrl;
  final String? description;
  final String? faviconUrl;
  final int unreadCount;

  const Feed({
    required this.id,
    required this.userId,
    this.folderId,
    required this.title,
    required this.url,
    required this.feedUrl,
    this.description,
    this.faviconUrl,
    this.unreadCount = 0,
  });

  factory Feed.fromJson(Map<String, dynamic> json) => Feed(
        id: json['id'] as String,
        userId: json['userId'] as String,
        folderId: json['folderId'] as String?,
        title: json['title'] as String,
        url: json['url'] as String,
        feedUrl: json['feedUrl'] as String,
        description: json['description'] as String?,
        faviconUrl: json['faviconUrl'] as String?,
        unreadCount: json['unreadCount'] as int? ?? 0,
      );
}
