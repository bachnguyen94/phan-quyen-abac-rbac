interface Attribute {
  key: string;
  value: string | number;
}

interface PolicyCondition {
  subjectAttr: string;
  operator: "==" | "!=";
  objectAttr: string;
}

interface Policy {
  name: string;
  conditions: PolicyCondition[];
}

// Khai báo chính sách ABAC
const policies: Policy[] = [
  {
    name: "Admin toàn quyền",
    conditions: [
      { subjectAttr: "role", operator: "==", objectAttr: "admin" }
    ]
  },
  {
    name: "Manager chỉ sửa nhân viên cùng phòng",
    conditions: [
      { subjectAttr: "role", operator: "==", objectAttr: "manager" },
      { subjectAttr: "department", operator: "==", objectAttr: "department" }
    ]
  },
  {
    name: "Staff chỉ sửa chính mình",
    conditions: [
      { subjectAttr: "role", operator: "==", objectAttr: "staff" },
      { subjectAttr: "id", operator: "==", objectAttr: "id" }
    ]
  }
];

//Kiểm tra ABAC
function checkAccess(subject: User, object: User): boolean {
  for (const policy of policies) {
    let match = true;

    for (const cond of policy.conditions) {
      const subjectVal = (subject as any)[cond.subjectAttr];
      const objectVal =
        cond.objectAttr === "admin" ||
        cond.objectAttr === "manager" ||
        cond.objectAttr === "staff"
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

const admin: User = { id: 1, name: "Admin", role: "admin", department: "HR" };
const manager: User = { id: 2, name: "Manager", role: "manager", department: "IT" };
const staff: User = { id: 3, name: "Staff", role: "staff", department: "IT" };

const target: User = { id: 4, name: "Alice", role: "staff", department: "IT" };

console.log(checkAccess(admin, target));   // true
console.log(checkAccess(manager, target)); // true
console.log(checkAccess(staff, target));   // false
console.log(checkAccess(staff, staff));    // true