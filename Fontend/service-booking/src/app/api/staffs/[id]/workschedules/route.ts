import { NextResponse } from "next/server";

const BACKEND_BASE = "https://localhost:7118/api/staffs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const pageNumber = searchParams.get("pageNumber") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    const authHeader = request.headers.get("authorization");

    const backendUrl = `${BACKEND_BASE}/${id}/workschedules?pageNumber=${pageNumber}&pageSize=${pageSize}`;

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
        { message: data?.message || `Không thể lấy lịch làm việc của nhân viên #${id}` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Lỗi mạng";
    return NextResponse.json(
      { message: `Lỗi kết nối: ${errMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const { id } = await params;

    const authHeader = request.headers.get("authorization");
    const body = await request.json();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(`${BACKEND_BASE}/${id}/workschedules`, {
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
              ? "Bạn không có quyền Admin để tạo lịch làm việc"
              : `Tạo lịch làm việc thất bại (Status: ${response.status})`),
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data || { message: "Tạo lịch làm việc thành công" });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Lỗi kết nối";
    return NextResponse.json(
      { message: `Không thể kết nối: ${errMessage}` },
      { status: 500 }
    );
  }
}
