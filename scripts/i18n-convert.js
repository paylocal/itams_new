const fs = require('fs');
const path = require('path');

// Mapping tu cac chuoi tieng Viet thuong gap sang i18n keys.
const mapping = [
  { s: "Thêm", k: "common.add" },
  { s: "Thêm mới", k: "common.addNew" },
  { s: "Thêm mới ", k: "common.addNew" },
  { s: "Lưu", k: "common.save" },
  { s: "Cập nhật", k: "common.update" },
  { s: "Hủy", k: "common.cancel" },
  { s: "Sửa", k: "common.edit" },
  { s: "Xóa", k: "common.delete" },
  { s: "Xem", k: "common.view" },
  { s: "Tìm kiếm", k: "common.search" },
  { s: "Tìm", k: "common.search" },
  { s: "Tải", k: "common.loading" },
  { s: "Đang tải...", k: "common.loading" },
  { s: "Đang lưu...", k: "common.saving" },
  { s: "Đang xử lý...", k: "common.processing" },
  { s: "Tên", k: "common.name" },
  { s: "Mã", k: "common.code" },
  { s: "Mô tả", k: "common.description" },
  { s: "Trạng thái", k: "common.status" },
  { s: "Hoạt động", k: "common.active" },
  { s: "Vô hiệu hóa", k: "common.inactive" },
  { s: "Vô hiệu hoá", k: "common.inactive" },
  { s: "Kích hoạt", k: "common.activate" },
  { s: "Hành động", k: "common.actions" },
  { s: "Không", k: "common.no" },
  { s: "Có", k: "common.yes" },
  { s: "Có ", k: "common.yes" },
  { s: "Danh sách", k: "common.list" },
  { s: "Không có dữ liệu", k: "common.noData" },
  { s: "Chưa có dữ liệu", k: "common.noData" },
  { s: "Quay lại", k: "common.back" },
  { s: "Gửi", k: "common.send" },
  { s: "Ghi chú", k: "common.note" },
  { s: "Ngày", k: "common.date" },
  { s: "Ngày tạo", k: "common.createdAt" },
  { s: "Người tạo", k: "common.createdBy" },
  { s: "Chi tiết", k: "common.detail" },
  { s: "Xem chi tiết", k: "common.viewDetail" },
  { s: "Lỗi", k: "common.error" },
  { s: "Thành công", k: "common.success" },
  { s: "Thất bại", k: "common.failure" },
  { s: "Tiếp theo", k: "common.next" },
  { s: "Quay lại", k: "common.back" },
  { s: "Chọn", k: "common.select" },
  { s: "Tất cả", k: "common.all" },
  { s: "Bộ lọc", k: "common.filter" },
  { s: "Số lượng", k: "common.quantity" },
  { s: "Đơn giá", k: "common.unitPrice" },
  { s: "Thành tiền", k: "common.lineTotal" },
  { s: "Tổng cộng", k: "common.total" },
  { s: "Tổng tiền", k: "common.total" },
  { s: "Nhà cung cấp", k: "supplier.title" },
  { s: "Mã NCC", k: "supplier.code" },
  { s: "Tên NCC", k: "supplier.name" },
  { s: "Người liên hệ", k: "supplier.contact" },
  { s: "Số điện thoại", k: "common.phone" },
  { s: "Email", k: "common.email" },
  { s: "Địa chỉ", k: "common.address" },
  { s: "Mã số thuế", k: "supplier.taxCode" },
  { s: "Thêm nhà cung cấp", k: "supplier.add" },
  { s: "Sửa nhà cung cấp", k: "supplier.edit" },
  { s: "Xóa nhà cung cấp", k: "supplier.delete" },
  { s: "Nhóm người dùng", k: "group.title" },
  { s: "Cấp độ", k: "group.level" },
  { s: "Thành viên", k: "group.members" },
  { s: "Quy trình phê duyệt", k: "workflow.title" },
  { s: "Luật", k: "workflow.rule" },
  { s: "Giá trị", k: "common.value" },
  { s: "Toán tử", k: "workflow.operator" },
  { s: "Ngôn ngữ", k: "language.title" },
  { s: "Mã ngôn ngữ", k: "language.code" },
  { s: "Mặc định", k: "common.default" },
  { s: "Dịch", k: "translation.title" },
  { s: "Khóa", k: "translation.key" },
  { s: "Giá trị", k: "translation.value" },
  { s: "Danh mục", k: "category.title" },
  { s: "Thiết bị", k: "common.device" },
  { s: "Model", k: "common.model" },
  { s: "Hãng", k: "common.brand" },
  { s: "Giá trung bình", k: "common.avgPrice" },
  { s: "Vai trò", k: "common.role" },
  { s: "Phòng ban", k: "common.department" },
  { s: "Mật khẩu", k: "common.password" },
  { s: "Nhập", k: "common.enter" },
  { s: "Bắt buộc", k: "common.required" },
];

const files = process.argv.slice(2);

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf-8');
  const isClient = content.includes('"use client"') || content.includes("'use client'");
  if (!isClient) continue;

  // Them useI18n neu chua co
  if (!content.includes('useI18n')) {
    content = content.replace(
      /("use client"[\s\S]*?\n)/,
      `$1import { useI18n } from "@/components/i18n-provider";\n`
    );
  }
  if (!content.includes('const { t } = useI18n()')) {
    // Chen sau export function ...() {
    content = content.replace(
      /(export\s+function\s+\w+\([^)]*\)\s*\{)/,
      `$1\n  const { t } = useI18n();`
    );
  }

  // Replace cac chuoi text trong JSX text nodes. Uu tien chuoi dai truoc.
  const sorted = [...mapping].sort((a, b) => b.s.length - a.s.length);
  for (const { s, k } of sorted) {
    // Thay the trong JSX text nodes: >text< hoac {'text'}
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Tranh thay trong fallback da co dang t("key", "text")
    const regex = new RegExp(`(")([^"]*?)${escaped}([^"]*?)(")`, 'g');
    content = content.replace(regex, (match, before, middle1, middle2, quote) => {
      // Neu chua duoc boc trong t(, thay bang t()
      if (match.includes('t(') || match.includes('fallback')) return match;
      const fullText = (middle1 + s + middle2).trim();
      if (!fullText) return match;
      return `{t("${k}", "${fullText}")}`;
    });
  }

  // Cleanup: cac truong hop >{t(...)}text< co the can thanh >{t(...)}text< ?
  // Ghi lai
  fs.writeFileSync(file, content, 'utf-8');
  console.log('Processed', file);
}
