/*
Admin: Xem/sửa/xóa được toàn bộ nhân sự.

Manager: Chỉ được xem/sửa nhân viên cùng phòng.

Staff: Chỉ được xem thông tin của chính mình.

Nhược điểm:
Gắn chặt logic với role cố định.

Khi thay đổi tổ chức → phải sửa code hoặc thêm role mới.

Không tái sử dụng linh hoạt.

*/

type Role = "admin" | "manager" | "staff";

interface User {
  id: number;
  name: string;
  role: Role;
  department: string;
}

function canEdit(targetUser: User, currentUser: User): boolean {
  if (currentUser.role === "admin") {
    return true; // Admin có toàn quyền
  }

  if (currentUser.role === "manager") {
    return currentUser.department === targetUser.department; // Manager chỉ quản lý cùng phòng
  }

  if (currentUser.role === "staff") {
    return currentUser.id === targetUser.id; // Staff chỉ sửa được thông tin bản thân
  }

  return false;
}
