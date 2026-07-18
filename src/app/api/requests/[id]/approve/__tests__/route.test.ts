import { approveRequest } from "../approve-service";

type MockRequest = {
  id: string;
  requestNumber: string;
  requester: {
    id: string;
    email: string;
    managerId: string;
    manager: { id: string; name: string; email: string };
  };
  approvalSteps: Array<{ id: string; stepNumber: number }>;
  currentStep: number;
  status: string;
};

const db = {
  assetRequest: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  approvalStep: {
    update: vi.fn(),
    create: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
};

const sendEmail = vi.fn().mockResolvedValue({ success: true });

function makeRequest(overrides: Partial<MockRequest> = {}): MockRequest {
  return {
    id: "req-1",
    requestNumber: "REQ-0001",
    requester: {
      id: "emp-1",
      email: "employee@test.com",
      managerId: "mgr-1",
      manager: {
        id: "mgr-1",
        name: "Manager",
        email: "manager@test.com",
      },
    },
    approvalSteps: [],
    currentStep: 1,
    status: "PENDING_MANAGER",
    ...overrides,
  };
}

describe("approve-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.assetRequest.update.mockResolvedValue({});
    db.approvalStep.update.mockResolvedValue({});
    db.approvalStep.create.mockResolvedValue({});
    db.user.findMany.mockResolvedValue([]);
    db.user.findFirst.mockResolvedValue(null);
  });

  it("returns 404 when request not found", async () => {
    db.assetRequest.findUnique.mockResolvedValue(null);

    const res = await approveRequest(
      {
        requestId: "missing",
        decision: "APPROVED",
        currentUser: { id: "mgr-1", role: "MANAGER" },
      },
      { db, sendEmail }
    );

    expect(res.status).toBe(404);
  });

  it("approves a request as manager", async () => {
    const request = makeRequest({
      id: "req-approved",
      approvalSteps: [{ id: "step-1", stepNumber: 1 }],
    });
    db.assetRequest.findUnique.mockResolvedValue(request);
    db.user.findFirst.mockResolvedValue({ email: "it@test.com" });

    const res = await approveRequest(
      {
        requestId: request.id,
        decision: "APPROVED",
        comment: "OK",
        currentUser: { id: "mgr-1", role: "MANAGER" },
      },
      { db, sendEmail }
    );

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("PENDING_IT");
    expect(db.assetRequest.update).toHaveBeenCalledWith({
      where: { id: request.id },
      data: { status: "PENDING_IT", currentStep: 2, isLocked: true },
    });
  });

  it("rejects with comment and resets to DRAFT", async () => {
    const request = makeRequest({
      id: "req-reject",
      approvalSteps: [{ id: "step-1", stepNumber: 1 }],
    });
    db.assetRequest.findUnique.mockResolvedValue(request);

    const res = await approveRequest(
      {
        requestId: request.id,
        decision: "REJECTED",
        comment: "Het tien",
        currentUser: { id: "mgr-1", role: "MANAGER", name: "Manager" },
      },
      { db, sendEmail }
    );

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("DRAFT");
    expect(db.assetRequest.update).toHaveBeenCalledWith({
      where: { id: request.id },
      data: { status: "DRAFT", currentStep: 1, isLocked: false },
    });
  });

  it("returns 400 if rejected without comment", async () => {
    const request = makeRequest({ id: "req-no-comment" });
    db.assetRequest.findUnique.mockResolvedValue(request);

    const res = await approveRequest(
      {
        requestId: request.id,
        decision: "REJECTED",
        currentUser: { id: "mgr-1", role: "MANAGER" },
      },
      { db, sendEmail }
    );

    expect(res.status).toBe(400);
  });

  it("returns 403 if not allowed", async () => {
    const request = makeRequest({ id: "req-forbidden" });
    db.assetRequest.findUnique.mockResolvedValue(request);

    const res = await approveRequest(
      {
        requestId: request.id,
        decision: "APPROVED",
        currentUser: { id: "other-user", role: "EMPLOYEE" },
      },
      { db, sendEmail }
    );

    expect(res.status).toBe(403);
  });
});