class User {
  final String id;
  final String name;
  final String email;
  final bool emailVerified;
  final String? image;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.emailVerified,
    this.image,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] as String,
        name: json['name'] as String,
        email: json['email'] as String,
        emailVerified: json['emailVerified'] as bool? ?? false,
        image: json['image'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'emailVerified': emailVerified,
        'image': image,
      };
}
