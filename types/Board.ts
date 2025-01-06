export type Board = {
  id: string;
  orgId: string;
  title: string;
  imageId: string;
  imageThumbUrl: string;
  imageFullUrl: string;
  imageUserName: string;
  imageLinkHTML: string;
  createdAt: Date;
  updatedAt: Date;
  list: List[];
};
export type Card = {
  all_day: boolean;
  board_column_id: number;
  comments_count: number;
  createdAt: string;
  createdBy: number;
  description: string;
  documents_count: number;
  end_time: string;
  id: number;
  is_deleted: boolean;
  location: string;
  recurrence_pattern: string;
  schedule_participants: Participant[];
  start_time: string;
  status: string;
  title: string;
  updatedAt: string;
  video_transcript: string;
  visibility: string;
  workspace_id: number;
  position: number;
  priority: string;
  extra_data: string;
  workspace_user_id: number;
};

export type Participant = {
  assign_at: string;
  assign_by: number;
  email: string;
  first_name: string;
  id: number;
  invitation_sent_at: string;
  invitation_status: string;
  is_verified: boolean;
  last_name: string;
  profile_picture: string;
  response_time: string;
  role: string;
  schedule_id: number;
  status: string;
  status_workspace_user: string;
  user_id: number;
  workspace_user_id: number;
};

export type List = {
  id: string;
  createdAt: string;
  deletedAt: string;
  description: string;
  extra_data: string;
  isDeleted: boolean;
  key: string;
  title: string;
  type: string;
  updatedAt: string;
  name: string;
  position: number;
  workspace_id: number;
  schedules: Card[];
};

export type AuditLog = {
  id: string;
  orgId: string;
  action: ACTION;
  entityId: string;
  entityType: ENTITY_TYPE;
};

export type Workspace = {
  ID: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  title: string;
  extraData: string;
  description: string;
  key: string;
  type: string;
  isDeleted: boolean;
  lists: List[];
};

export type Member = {
  id: number;
  email: string;
  extra_data: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  is_active: boolean;
  is_verified: boolean;
  user_email_id: number;
  workspace_id: number;
  workspace_key: string;
};

export type Comment = {
  ID: number;
  commenter: string;
  content: string;
  created_at: string;
  email: string;
  first_name: string;
  is_deleted: boolean;
  is_verified: boolean;
  last_name: string;
  profile_picture: string;
  role: string;
  schedule_id: number;
  status_workspace_user: string;
  updated_at: string;
  user_id: number;
  workspace_user_id: number;
  workspace_id: number;
};

export type Reminder = {
  created_at: string;
  deleted_at: string;
  id: number;
  is_sent: boolean;
  method: string;
  reminder_time: string;
  schedule: Card;
  schedule_id: number;
  type: string;
  updated_at: string;
  workspaceUser: Member;
  workspace_user_id: number;
};

export enum ACTION {
  CREATE,
  UPDATE,
  DELETE,
}

export enum ENTITY_TYPE {
  BOARD,
  LIST,
  CARD,
}

export type ListWithCards = List & { cards: Card[] };

export type CardWithList = Card & { list: List };

export type NotificationItem = {
    id: number;
    title?: string;
    description: string;
    link?: string;
    is_read?: boolean
}