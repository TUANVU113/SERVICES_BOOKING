import { NextResponse } from "next/server";

const BACKEND_BASE = "https://localhost:7118/api/bookings";

export async function GET(request: Request) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const { searchParams } = new URL(request.url);
    const pageNumber = searchParams.get("pageNumber") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const authHeader = request.headers.get("authorization");

    let backendUrl = `${BACKEND_BASE}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (status) {
      backendUrl += `&status=${encodeURIComponent(status)}`;
    }
    if (date) {
      backendUrl += `&date=${encodeURIComponent(date)}`;
    }

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
        { message: data?.message || "Không thể lấy danh sách lịch đặt" },
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
            `Đặt lịch thất bại (Status: ${response.status})`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data || { message: "Đặt lịch thành công!" });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Lỗi kết nối";
    return NextResponse.json(
      { message: `Không thể kết nối: ${errMessage}` },
      { status: 500 }
    );
  }
}

