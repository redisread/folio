import 'package:flutter/material.dart';
import '../models/folder.dart';
import '../models/feed.dart';
import 'feed_list_tile.dart';

/// 文件夹树组件（包含嵌套的订阅源）
class FolderTree extends StatelessWidget {
  final Folder folder;
  final List<Feed> feeds;

  const FolderTree({super.key, required this.folder, required this.feeds});

  @override
  Widget build(BuildContext context) {
    return ExpansionTile(
      leading: Icon(
        Icons.folder,
        color: folder.color != null
            ? Color(int.parse(folder.color!.replaceFirst('#', '0xFF')))
            : null,
      ),
      title: Text(folder.name),
      initiallyExpanded: !folder.isCollapsed,
      children: feeds.map((feed) => FeedListTile(feed: feed)).toList(),
    );
  }
}
