# ===== Build stage =====
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy file project trước
COPY ["Backend.csproj", "./"]

# Restore các package
RUN dotnet restore "Backend.csproj"

# Copy toàn bộ source code
COPY . .

# Build và publish
RUN dotnet publish "Backend.csproj" -c Release -o /app/publish /p:UseAppHost=false


# ===== Runtime stage =====
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Copy kết quả đã publish từ build stage
COPY --from=build /app/publish .

# Port mà ASP.NET Core container sẽ lắng nghe
EXPOSE 8080

# Chạy ứng dụng
ENTRYPOINT ["dotnet", "Backend.dll"]