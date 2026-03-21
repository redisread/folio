class Folder {
  final String id;
  final String userId;
  final String name;
  final String? color;
  final String? icon;
  final int sortOrder;
  final bool isCollapsed;

  const Folder({
    required this.id,
    required this.userId,
    required this.name,
    this.color,
    this.icon,
    this.sortOrder = 0,
    this.isCollapsed = false,
  });

  factory Folder.fromJson(Map<String, dynamic> json) => Folder(
        id: json['id'] as String,
        userId: json['userId'] as String,
        name: json['name'] as String,
        color: json['color'] as String?,
        icon: json['icon'] as String?,
        sortOrder: json['sortOrder'] as int? ?? 0,
        isCollapsed: json['isCollapsed'] as bool? ?? false,
      );
}
