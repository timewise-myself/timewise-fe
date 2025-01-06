import { Button } from "@/components/ui/Button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    action: string;
}

const Modal = ({ isOpen, onClose, onConfirm, action }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-md w-1/3">
                <h3 className="text-xl mb-4">{action} Email</h3>
                <p>Are you sure you want to {action.toLowerCase()} this email?</p>
                <div className="mt-4 flex justify-end gap-4">
                    <Button className="bg-gray-300" onClick={onClose}>Cancel</Button>
                    <Button className="bg-red-500" onClick={onConfirm}>Confirm</Button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
