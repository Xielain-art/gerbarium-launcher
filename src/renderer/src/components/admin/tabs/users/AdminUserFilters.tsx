import { Button as ShadcnButton } from "@/components/shadcn/ui/button";
import { Input as ShadcnInput } from "@/components/shadcn/ui/input";
import { Select as ShadcnSelect } from "@/components/shadcn/ui/select";

interface UserFiltersProps {
  isApplyingUserFilters: boolean;
  isLoading: boolean;
  onRefresh: () => void;
  refreshLabel: string;
  loadingLabel: string;
  userSearchInput: string;
  setUserSearchInput: (value: string) => void;
  userRoleFilter: string;
  setUserRoleFilter: (value: string) => void;
  userBanFilter: "all" | "banned" | "active";
  setUserBanFilter: (value: "all" | "banned" | "active") => void;
  roleOptions: Array<{ label: string; value: string }>;
  onSetUserFilters: (filters: { role?: string; banned?: boolean }) => void;
}

export function AdminUserFilters(props: UserFiltersProps): React.JSX.Element {
  const {
    isApplyingUserFilters,
    isLoading,
    onRefresh,
    refreshLabel,
    loadingLabel,
    userSearchInput,
    setUserSearchInput,
    userRoleFilter,
    setUserRoleFilter,
    userBanFilter,
    setUserBanFilter,
    roleOptions,
    onSetUserFilters,
  } = props;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isApplyingUserFilters && (
            <div className="font-mono text-[10px] uppercase text-theme-muted">
              Applying filters...
            </div>
          )}
          <ShadcnButton variant="default" onClick={onRefresh} disabled={isLoading}>
            {isLoading ? loadingLabel : refreshLabel}
          </ShadcnButton>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <ShadcnInput
          label="Search"
          placeholder="Search by username or email..."
          value={userSearchInput}
          onChange={(e) => setUserSearchInput(e.target.value)}
        />
        <ShadcnSelect
          label="Role"
          value={userRoleFilter}
          onChange={(e) => {
            const val = typeof e === "string" ? e : e.target.value;
            setUserRoleFilter(val);
            onSetUserFilters({ role: val === "all" ? undefined : val });
          }}
          options={roleOptions}
        />
        <ShadcnSelect
          label="Status"
          value={userBanFilter}
          onChange={(e) => {
            const val = (
              typeof e === "string" ? e : e.target.value
            ) as "all" | "banned" | "active";
            setUserBanFilter(val);
            onSetUserFilters({
              banned: val === "all" ? undefined : val === "banned",
            });
          }}
          options={[
            { label: "All", value: "all" },
            { label: "Banned", value: "banned" },
            { label: "Active", value: "active" },
          ]}
        />
      </div>
    </>
  );
}
