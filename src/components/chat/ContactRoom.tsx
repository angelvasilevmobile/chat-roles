import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Smartphone, Send, Mail, MessageSquare, User } from "lucide-react";

const ContactRoom = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSending(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll get back to you soon.");
    setName("");
    setEmail("");
    setMessage("");
    setSending(false);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
        {/* Contact Form */}
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-1">
            <Mail className="h-5 w-5 text-primary" />
            Contact Us
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Have feedback or need help? Drop us a message.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name" className="text-xs text-muted-foreground">
                Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-email" className="text-xs text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  maxLength={255}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-message" className="text-xs text-muted-foreground">
                Message
              </Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  maxLength={1000}
                  rows={4}
                  className="pl-9 resize-none"
                />
              </div>
            </div>

            <Button type="submit" disabled={sending} className="w-full gap-2">
              <Send className="h-4 w-4" />
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>

        {/* Android App Link */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Get the Android App</h3>
              <p className="text-xs text-muted-foreground">
                Take the chat with you on the go
              </p>
            </div>
          </div>
          <a
            href="https://github.com/niceboulder/role-play-chatter/releases"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="w-full gap-2">
              <Smartphone className="h-4 w-4" />
              Download for Android
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactRoom;
