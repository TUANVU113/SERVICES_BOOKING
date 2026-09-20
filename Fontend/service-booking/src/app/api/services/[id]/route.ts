import { NextResponse } from "next/server";

const BACKEND_BASE = "https://localhost:7118/api/services";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const { id } = await params;

    const response = await fetch(`${BACKEND_BASE}/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || `Không thể lấy chi tiết dịch vụ #${id}` },
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

export async function PUT(
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

    const response = await fetch(`${BACKEND_BASE}/${id}`, {
      method: "PUT",
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
              : `Cập nhật dịch vụ thất bại (Status: ${response.status})`),
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data || { message: "Cập nhật dịch vụ thành công" });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Lỗi kết nối";
    return NextResponse.json(
      { message: `Không thể kết nối Backend API: ${errMessage}` },
      { status: 500 }
    );
  }
}
