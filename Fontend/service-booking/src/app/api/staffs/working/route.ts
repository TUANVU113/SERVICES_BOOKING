import { NextResponse } from "next/server";

const BACKEND_BASE = "https://localhost:7118/api/staffs/working";

export async function GET(request: Request) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const authHeader = request.headers.get("authorization");

    let backendUrl = BACKEND_BASE;
    if (date) {
      backendUrl += `?date=${encodeURIComponent(date)}`;
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
        { message: data?.message || "Không thể lấy danh sách nhân viên có ca làm việc" },
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

