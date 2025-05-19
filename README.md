# TeamFlowV2

Ứng dụng quản lý dự án và công việc theo nhóm xây dựng với Next.js và MongoDB.

## Tính năng chính

- **Quản lý dự án**: Tạo, chỉnh sửa, xóa và lưu trữ dự án
- **Quản lý công việc**: Theo dõi tiến độ các nhiệm vụ trong dự án
- **Quản lý thành viên**: Mời và phân quyền thành viên trong dự án
- **Hệ thống vai trò**: Chủ sở hữu, Quản trị viên và Thành viên
- **Dashboard**: Theo dõi tổng quan về các dự án và công việc

## Công nghệ sử dụng

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **UI Components**: Shadcn UI

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Tạo Prisma client
npx prisma generate

# Chạy ứng dụng ở môi trường phát triển
npm run dev
```

## Cấu trúc thư mục

- `app/`: Route components (Next.js App Router)
- `components/`: UI components
- `lib/`: Utilities và business logic
- `prisma/`: Database schema và migrations
- `public/`: Static assets

## License

[MIT](https://choosealicense.com/licenses/mit/)
