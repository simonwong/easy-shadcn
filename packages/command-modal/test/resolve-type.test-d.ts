import { describe, expectTypeOf, it } from "vitest";
import { create, show } from "../src/actions";

type User = { id: string; name: string };

describe("resolve type carried on create<Props, Result> (issue #69)", () => {
  it("show(create<Props, Result>(Comp)) resolves with Result", () => {
    const EditUser = create<{ userId: string }, User>(() => null);
    expectTypeOf(show(EditUser)).toEqualTypeOf<Promise<User>>();
  });

  it("checks show args against Props (the __resolveType brand must not erase prop inference)", () => {
    const EditUser = create<{ userId: string }, User>(() => null);
    // Valid args accepted.
    show(EditUser, { userId: "x" });
    // @ts-expect-error - userId must be a string
    show(EditUser, { userId: 123 });
    // @ts-expect-error - unknown prop rejected
    show(EditUser, { nope: true });
  });

  it("resolves with Promise<unknown> when Result is omitted, args still checked", () => {
    const FormModal = create<{ userId: string }>(() => null);
    expectTypeOf(show(FormModal)).toEqualTypeOf<Promise<unknown>>();
    // Args are still validated even without a Result type.
    // @ts-expect-error - userId must be a string
    show(FormModal, { userId: 123 });
  });

  it("resolves with a primitive Result (confirm-dialog shape)", () => {
    const ConfirmModal = create<Record<never, never>, boolean>(() => null);
    expectTypeOf(show(ConfirmModal)).toEqualTypeOf<Promise<boolean>>();
  });

  it("string-id path keeps the explicit Result type argument", () => {
    expectTypeOf(show<User>("user-modal")).toEqualTypeOf<Promise<User>>();
    expectTypeOf(show("user-modal")).toEqualTypeOf<Promise<unknown>>();
  });
});
