import { NextResponse } from "next/server";

const BACKEND_BASE = "https://localhost:7118/api/staffs";

export async function GET(request: Request) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const { searchParams } = new URL(request.url);
    const pageNumber = searchParams.get("pageNumber") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    const authHeader = request.headers.get("authorization");

    const backendUrl = `${BACKEND_BASE}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || "Không thể lấy danh sách nhân viên từ máy chủ" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Lỗi mạng";
    return NextResponse.json(
      { message: `Lỗi kết nối Backend API: ${errMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const authHeader = request.headers.get("authorization");
    const body = await request.json();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(BACKEND_BASE, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ||
            data?.title ||
            (response.status === 403
              ? "Bạn không có quyền Admin để thực hiện thao tác này"
              : `Tạo nhân viên thất bại (Status: ${response.status})`),
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data || { message: "Tạo nhân viên mới thành công" });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Lỗi kết nối";
    return NextResponse.json(
      { message: `Không thể kết nối Backend API: ${errMessage}` },
      { status: 500 }
    );
  }
}
