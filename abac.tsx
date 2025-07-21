type Role = "admin" | "manager" | "staff";

interface Attribute {
  key: string;
  value: string | number;
}

interface PolicyCondition {
  subjectAttr?: string;
  subjectValue?: string
  operator: "==" | "!=";
  objectAttr?: string;
  objectValue?: string
}

/* Nếu thêm field effect ở đây là true hoặc false thì ở trong logic hàm
checkAccess nếu case nào effect là false thì sẽ phải định nghĩa cho trường hợp
ngược lại khi effect là true cho case đó. Vì hàm checkAccess sẽ trả về mặc định là false
nếu không có policy nào khớp với điều kiện */
interface Policy {
  name: string;
  action: string;
  effect: boolean; // True nếu được phép, false nếu bị từ chối
  conditions: PolicyCondition[];
}

interface User {
  id: number;
  name: string;
  role: Role;
  department: string;
}

// Khai báo chính sách ABAC
const policies: Policy[] = [
  {
    name: "Admin toàn quyền",
    action: "admin_full_access",
    effect: true,
    conditions: [
      { subjectAttr: "role", operator: "==", subjectValue: "admin" }
    ]
  },
  {
    name: "Manager chỉ sửa nhân viên cùng phòng",
    action: "manager_department_access",
    effect: true,
    conditions: [
      { subjectAttr: "role", operator: "==", subjectValue: "manager" },
      { subjectAttr: "department", operator: "==", objectAttr: "department" }
    ]
  },
  {
    name: "Manager phòng HR có thể sửa nhân viên phòng IT",
    action: "manager_hr_access_it",
    effect: true,
    conditions: [
      { subjectAttr: "role", operator: "==", subjectValue: "manager" },
      { subjectAttr: "department", operator: "==", subjectValue: "HR" },
      { objectAttr: "department", operator: "==", objectValue: "IT" }
    ]
  },
  {
    name: "Staff HR không sửa được thông tin HR còn lại đều sửa được",
    action: "staff_hr_do_not_access_this_self",
    effect: true,
    conditions: [
      { subjectAttr: "role", operator: "==", subjectValue: "staff" },
      { subjectAttr: "department", operator: "!=", subjectValue: "HR" },
      { objectAttr: "department", operator: "==", objectValue: "HR" }
    ]
  },
  {
    name: "Staff chỉ sửa chính mình",
    action: "staff_self_access",
    effect: true,
    conditions: [
      { subjectAttr: "role", operator: "==", subjectValue: "staff" },
      { subjectAttr: "id", operator: "==", objectAttr: "id" }
    ]
  }
];
function canPerformAction(action: string, object: User): any {
  for (const policy of policies) {
    if (policy.action === action) {
      let match = true;
      for (const cond of policy.conditions) {
        const subjectVal = (object as any)[cond.subjectAttr];
        if (cond.operator === "==" && subjectVal != cond.objectAttr) {
          return false; // Không khớp điều kiện
        }
        if (cond.operator === "!=" && subjectVal == cond.objectAttr) {
          return false; // Không khớp điều kiện
        }
      }
      if (match) {
        return true; // Quyền được cấp
      }
    }
  }
  return false;
}

//Kiểm tra ABAC
function checkAccess_bk(subject: User, object: User): boolean {
  for (const policy of policies) {
    let match = true;

    for (const cond of policy.conditions) {
      const subjectVal = (subject as any)[cond.subjectAttr];
      const objectVal =
        cond.objectAttr !== cond.subjectAttr
          ? cond.objectAttr
          : (object as any)[cond.objectAttr];

      if (cond.operator === "==" && subjectVal != objectVal) {
        match = false;
        break;
      }

      if (cond.operator === "!=" && subjectVal == objectVal) {
        match = false;
        break;
      }
    }

    if (match) return true;
  }
  return false;
}

function checkAccess(subject: User, object: User): boolean | string {
  for (const policy of policies) {
    let match = true;

    for (const cond of policy.conditions) {
      let key = '';
      let value = '';
      const entries = Object.entries(cond); 
      const [[key1, obj1], [key2, obj2], [key3, obj3]] = entries;
      if (key3 === 'subjectValue' || key3 === 'objectValue') {
        value = obj3;
      }
      if (key1 === 'subjectAttr') {
        key = subject[obj1];
      }
      if (key1 === 'objectAttr') {
        key = object[obj1];
      }
      if (key1 === 'subjectAttr' && key3 === 'objectAttr') {
        key = subject[obj1];
        value = object[obj3];
      }


      if (obj2 === "==" && key != value) {
        match = false;
        break;
      }

      if (obj2 === "!=" && key == value) {
        match = false;
        break;
      }
    }

    if (match) return policy.effect;
  }
  return false;
}

const admin: User = { id: 1, name: "Admin", role: "admin", department: "HR" };
const manager: User = { id: 2, name: "Manager", role: "manager", department: "IT" };
const staffIT: User = { id: 3, name: "Staff", role: "staff", department: "IT" };
const managerHR: User = { id: 4, name: "ManagerHR", role: "manager", department: "HR" };
const staffHR: User = { id: 5, name: "StaffHR", role: "staff", department: "HR" };


const target: User = { id: 50, name: "Alice", role: "staff", department: "IT" };
const targetHR: User = { id: 51, name: "Bach", role: "staff", department: "HR" };

console.log(checkAccess(admin, target));   // true
console.log(checkAccess(manager, target)); // true
console.log(checkAccess(staffIT, target));   // false
console.log(checkAccess(staffIT, staffIT));    // true
console.log(checkAccess(managerHR, target));    // true
console.log(checkAccess(staffHR, targetHR));    // false
console.log(checkAccess(staffIT, targetHR));    // true
// console.log(canPerformAction("staff_self_access", admin) || canPerformAction("admin_full_access", admin)); // true