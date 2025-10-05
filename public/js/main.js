document.addEventListener('DOMContentLoaded', () => {
  // Delete handlers
  document.querySelectorAll('.delete-task').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = btn.dataset.id;
      if (!confirm('Delete this task?')) return;
      try {
        const res = await fetch(`/tasks/${id}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        if (data.success) {
          // remove card
          btn.closest('.task-card').remove();
        } else {
          alert('Delete failed');
        }
      } catch (err) {
        console.error(err);
        alert('Error deleting');
      }
    });
  });

  // Status change handlers
  document.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      const id = sel.dataset.id;
      const status = sel.value;
      try {
        const res = await fetch(`/tasks/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (!data.success) alert('Status update failed');
      } catch (err) {
        console.error(err);
        alert('Error updating status');
      }
    });
  });
});
