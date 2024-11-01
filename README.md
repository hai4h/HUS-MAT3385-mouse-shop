# MouseX E-Commerce - BRANCH DEVELOP

  - Branch phát triển chính
  - Chứa code mới nhất đã được test sơ bộ
  - Là branch để integrate code từ các feature branches

# Quy trình làm việc với develop:
## 1. Trước khi tạo feature mới:
```
git checkout develop
git pull origin develop
git checkout -b feature/your-feature
```

## 2. Khi feature hoàn thành:
```
git checkout develop
git pull origin develop
git merge feature/your-feature
git push origin develop
```
