import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import type { IParent } from "@/types/data-types";
import { updateParentInfo } from "@/lib/userApi"; // giả sử bạn có API này

interface EditParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  parent: IParent;
  onUpdated?: (updated: IParent) => void;
}

export default function EditParentModal({
  isOpen,
  onClose,
  parent,
  onUpdated,
}: EditParentModalProps) {
  const [fullName, setFullName] = useState(parent.fullName || "");
  const [phone, setPhone] = useState(parent.phone || "");
  const [email, setEmail] = useState(parent.email || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateParentInfo(parent.id, { fullName, phone, email });
      console.log("res: ",  { fullName, phone, email }, parent.id)
      onUpdated?.(res.data);
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 text-center bg-black/30">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="inline-block w-full max-w-lg p-8 my-20 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
              <Dialog.Title className="text-xl font-bold text-gray-900 mb-6">
                ✏️ Chỉnh sửa thông tin phụ huynh
              </Dialog.Title>

              <div className="space-y-5">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nhập họ tên phụ huynh"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nhập địa chỉ email"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${
                    loading
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
