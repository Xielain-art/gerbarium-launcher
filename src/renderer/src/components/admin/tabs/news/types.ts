import type { ApiNews } from "../../../../../../lib/api/news";

export interface FieldValidation {
  isValid: boolean;
  error: string | null;
  touched: boolean;
}

export interface AdminNewsTabProps {
  newsFormValidation: {
    titleValidation: FieldValidation;
    slugValidation: FieldValidation;
    contentValidation: FieldValidation;
    imageValidation: FieldValidation;
    isFormValid: boolean;
    handleBlur: (field: "title" | "slug" | "content" | "image") => void;
  };
  newsTagValidation: FieldValidation & { handleBlur: () => void };
  newsTab: "all" | "create" | "tags";
  setNewsTab: (v: "all" | "create" | "tags") => void;
  isApplyingNewsFilters: boolean;
  newsRows: ApiNews[];
  newsTags: Array<{ id: string; name: string }>;
  isLoadingNews: boolean;
  isLoadingMoreNews: boolean;
  newsEndRef: React.RefObject<HTMLDivElement | null>;
  newsSearch: string;
  setNewsSearch: (v: string) => void;
  newsTag: string;
  setNewsTag: (v: string) => void;
  newsSortDraft: string;
  setNewsSortDraft: (v: string) => void;
  newsOrderDraft: string;
  setNewsOrderDraft: (v: string) => void;
  newsFromDate: string;
  setNewsFromDate: (v: string) => void;
  newsToDate: string;
  setNewsToDate: (v: string) => void;
  editingNews: ApiNews | null;
  resetNewsForm: () => void;
  startEditNews: (n: ApiNews) => void;
  handleDeleteNews: (id: string) => void;
  newsTitle: string;
  setNewsTitle: (v: string) => void;
  newsSlug: string;
  setNewsSlug: (v: string) => void;
  newsImage: string;
  setNewsImage: (v: string) => void;
  newsContentHtml: string;
  setNewsContentHtml: (v: string) => void;
  selectedNewsTagIds: string[];
  setSelectedNewsTagIds: (v: string[]) => void;
  newNewsTagName: string;
  setNewNewsTagName: (v: string) => void;
  newsFormError: string | null;
  newsActionLoadingId: string | null;
  handleCreateNews: () => void;
  handleUpdateNews: () => void;
  filteredNewsTags: Array<{ id: string; name: string }>;
  isLoadingNewsTags: boolean;
  editingTagId: string | null;
  setEditingTagId: (v: string | null) => void;
  editingTagName: string;
  setEditingTagName: (v: string) => void;
  handleCreateNewsTag: () => void;
  handleUpdateNewsTag: () => void;
  handleDeleteNewsTag: (id: string) => void;
  isAdminApiBusy: boolean;
  newsTagFormError: string | null;
}
